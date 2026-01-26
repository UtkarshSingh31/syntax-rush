import { Group } from "../models/group.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createGroup = AsyncHandler(async (req, res) => {
  const { name, username, description, isPublic, maxMembers } = req.body;
  if (!name) throw new ApiError(400, "Group name is required");

  // Check if user is already in a group
  const existingMembership = await Group.findOne({ "members.userId": req.user._id });
  if (existingMembership) throw new ApiError(400, "You are already a member of a group. Leave it to create a new one.");

  try {
    const group = await Group.create({
      name,
      username: username || undefined,
      description,
      owner: req.user._id,
      members: [{ userId: req.user._id, role: "owner" }],
      isPublic,
      maxMembers
    });

    return res.status(201).json(new ApiResponse(201, { group }, "Group created successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Group username already exists");
    }
    throw error;
  }
});

const getMyGroups = AsyncHandler(async (req, res) => {
  const groups = await Group.find({ "members.userId": req.user._id })
    .populate("owner", "username fullname profilePicture")
    .populate("members.userId", "username fullname profilePicture");
  return res.status(200).json(new ApiResponse(200, { groups }, "Groups fetched successfully"));
});

const joinGroup = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const group = await Group.findById(id);

  if (!group) throw new ApiError(404, "Group not found");

  const isMemberOfAny = await Group.findOne({ "members.userId": req.user._id });
  if (isMemberOfAny) throw new ApiError(400, "You are already a member of a group. Leave it to join another.");

  const isMember = group.members.some(m => String(m.userId) === String(req.user._id));
  if (isMember) throw new ApiError(400, "Already a member");

  if (!group.isPublic) {
    // Check if already requested
    const alreadyRequested = group.joinRequests.some(r => String(r.userId) === String(req.user._id));
    if (alreadyRequested) throw new ApiError(400, "Join request already pending");

    group.joinRequests.push({ userId: req.user._id });
    await group.save();
    return res.status(200).json(new ApiResponse(200, { group }, "Join request sent successfully"));
  }

  if (group.members.length >= group.maxMembers) throw new ApiError(400, "Group is full");

  group.members.push({ userId: req.user._id, role: "member" });
  await group.save();

  return res.status(200).json(new ApiResponse(200, { group }, "Joined group successfully"));
});

const getJoinRequests = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const group = await Group.findById(id).populate("joinRequests.userId", "username fullname profilePicture");

  if (!group) throw new ApiError(404, "Group not found");

  const isAdmin = group.members.some(m => String(m.userId) === String(req.user._id) && m.role === "admin");
  const isOwner = String(group.owner) === String(req.user._id);

  if (!isOwner && !isAdmin) throw new ApiError(403, "Only owner or admins can see requests");

  return res.status(200).json(new ApiResponse(200, { requests: group.joinRequests }, "Join requests fetched"));
});

const handleJoinRequest = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, action } = req.body; // action: 'accept' or 'reject'

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  const isAdmin = group.members.some(m => String(m.userId) === String(req.user._id) && m.role === "admin");
  const isOwner = String(group.owner) === String(req.user._id);

  if (!isOwner && !isAdmin) throw new ApiError(403, "Unauthorized: Only owner or admins can handle requests");

  const requestIndex = group.joinRequests.findIndex(r => String(r.userId) === String(userId));
  if (requestIndex === -1) throw new ApiError(404, "Request not found");

  if (action === "accept") {
    if (group.members.length >= group.maxMembers) throw new ApiError(400, "Group is full");
    group.members.push({ userId, role: "member" });
  }

  group.joinRequests.splice(requestIndex, 1);
  await group.save();

  return res.status(200).json(new ApiResponse(200, { group }, `Join request ${action}ed`));
});

const searchGroups = AsyncHandler(async (req, res) => {
  const { query } = req.query;
  const groups = await Group.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } }
    ]
  }).limit(20);

  return res.status(200).json(new ApiResponse(200, { groups }, "Groups searched"));
});

const updateGroup = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, username, description, isPublic } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");
  if (String(group.owner) !== String(req.user._id)) throw new ApiError(403, "Unauthorized");

  if (name) group.name = name;
  if (username) group.username = username;
  if (description) group.description = description;
  if (isPublic !== undefined) group.isPublic = isPublic;

  try {
    await group.save();
    return res.status(200).json(new ApiResponse(200, { group }, "Group updated successfully"));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Group username already exists");
    }
    throw error;
  }
});

const leaveGroup = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const group = await Group.findById(id);

  if (!group) throw new ApiError(404, "Group not found");

  const memberIndex = group.members.findIndex(m => String(m.userId) === String(req.user._id));
  if (memberIndex === -1) throw new ApiError(400, "You are not a member of this group");

  const isOwner = String(group.owner) === String(req.user._id);

  if (isOwner) {
    // Succession logic
    const otherMembers = group.members.filter(m => String(m.userId) !== String(req.user._id));

    if (otherMembers.length === 0) {
      // No one else left, delete the group
      await Group.findByIdAndDelete(id);
      return res.status(200).json(new ApiResponse(200, {}, "Group deleted as the last member (owner) left"));
    }

    // Sort by role (primary: admin, secondary: member) and joinedAt
    // 1. Filter co-admins
    const coAdmins = otherMembers.filter(m => m.role === "admin");
    let successor;

    if (coAdmins.length > 0) {
      // Pick oldest co-admin
      successor = coAdmins.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())[0];
    } else {
      // Pick oldest member
      successor = otherMembers.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())[0];
    }

    // Transfer ownership
    group.owner = successor.userId;
    // Update successor role in the members array
    const successorIndex = group.members.findIndex(m => String(m.userId) === String(successor.userId));
    group.members[successorIndex].role = "owner";
  }

  // Remove the leaving user
  group.members = group.members.filter(m => String(m.userId) !== String(req.user._id));
  await group.save();

  return res.status(200).json(new ApiResponse(200, { group }, "Left group successfully. Ownership transferred if applicable."));
});

const promoteMember = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, "Group not found");

  // Only owner can promote to co-admin (admin)
  if (String(group.owner) !== String(req.user._id)) {
    throw new ApiError(403, "Only owner can promote members");
  }

  const memberIndex = group.members.findIndex(m => String(m.userId) === String(userId));
  if (memberIndex === -1) throw new ApiError(404, "User is not a member of this group");

  group.members[memberIndex].role = "admin"; // Using 'admin' as co-admin
  await group.save();

  return res.status(200).json(new ApiResponse(200, { group }, "Member promoted to co-admin"));
});

const getGroupSuggestions = AsyncHandler(async (req, res) => {
  // Suggest groups the user is not in
  const userGroups = await Group.find({ "members.userId": req.user._id }).select("_id");
  const userGroupIds = userGroups.map(g => g._id);

  const suggestions = await Group.find({
    _id: { $nin: userGroupIds },
    isPublic: true
  })
    .sort({ "members.length": -1 })
    .limit(5)
    .select("name username members description");

  return res.status(200).json(new ApiResponse(200, { suggestions }, "Suggestions fetched"));
});

const getGroupDetails = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const group = await Group.findById(id)
    .populate("owner", "username fullname profilePicture")
    .populate("members.userId", "username fullname profilePicture");
  if (!group) throw new ApiError(404, "Group not found");
  return res.status(200).json(new ApiResponse(200, { group }, "Group details fetched"));
});

export { createGroup, getMyGroups, joinGroup, getGroupDetails, getJoinRequests, handleJoinRequest, searchGroups, updateGroup, leaveGroup, promoteMember, getGroupSuggestions };
