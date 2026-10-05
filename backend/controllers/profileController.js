// =============================================================================
// SPANDANA — Profile Controller
// =============================================================================

const User = require("../models/User");

// GET /api/profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ user });
  } catch (err) {
    console.error("[profile] getProfile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

// PUT /api/profile
async function updateProfile(req, res) {
  try {
    const { weight, height, dateOfBirth, gender, fitnessGoal } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }
    
    if (weight !== undefined) user.profile.weight = weight;
    if (height !== undefined) user.profile.height = height;
    if (dateOfBirth !== undefined) user.profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.profile.gender = gender;
    if (fitnessGoal !== undefined) user.profile.fitnessGoal = fitnessGoal;
    
    // Check if required fields are present to mark profile as complete
    if (user.profile.weight && user.profile.height && user.profile.dateOfBirth) {
      user.profile.profileComplete = true;
    }
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password");
    
    // Refresh the pc (profileComplete) cookie so middleware sees the new status immediately
    res.cookie("pc", updatedUser.profile?.profileComplete ? "1" : "0", {
      httpOnly: false,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000,
      path:     "/",
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("[profile] updateProfile error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getProfile, updateProfile };
