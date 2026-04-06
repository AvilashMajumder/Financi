import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const generateTokens = async (userId) => {
    const user = await User.findById(userId).select("_id email username role");
    if (!user) {
        throw new Error("User not found for token generation");
    }

    const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );

    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
    );

    return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
    try {
        let { username, email, password, role } = req.body;

        if ([username, email, password].some((v) => !v || !v.toString().trim())) {
            return res
                .status(400)
                .json({ message: "Username, email, and password are required" });
        }

        username = username.trim().toLowerCase();
        email = email.trim().toLowerCase();
        const normalizedRole = role?.toString().trim().toLowerCase();
        role = normalizedRole === "admin" ? "Admin" : normalizedRole === "analyst" ? "Analyst" : "User";

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "User with this email or username already exists" });
        }

        const user = await User.create({ username, email, password, role });
        const created = await User.findById(user._id).select("-password -refreshToken");

        return res
            .status(201)
            .json({ message: "User created successfully", user: created });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        let { email, username, password } = req.body;

        if ((!email || !email.toString().trim()) && (!username || !username.toString().trim())) {
            return res
                .status(400)
                .json({ message: "Email or username and password are required" });
        }

        if (!password || !password.toString().trim()) {
            return res
                .status(400)
                .json({ message: "Email or username and password are required" });
        }

        email = email ? email.toString().trim().toLowerCase() : undefined;
        username = username ? username.toString().trim().toLowerCase() : undefined;

        const user = await User.findOne(email ? { email } : { username });
        if (!user || !(await user.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is inactive" });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "Login successful",
                accessToken,
                refreshToken,
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
            });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: null } },
            { new: true }
        );

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "Logged out successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken || req.headers["x-refresh-token"];

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Refresh token is required" });
        }

        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded?._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const { accessToken, refreshToken } = await generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ accessToken, refreshToken });
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ _id: -1 }).select("-password -refreshToken");
        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -refreshToken");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const normalizedRole = req.body?.role?.toString().trim().toLowerCase();
        if (!normalizedRole || !["user", "analyst", "admin"].includes(normalizedRole)) {
            return res
                .status(400)
                .json({ message: "Role must be user, analyst, or admin" });
        }

        const role = normalizedRole === "admin" ? "Admin" : normalizedRole === "analyst" ? "Analyst" : "User";

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { role } },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "Role updated", user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ message: "isActive must be a boolean value" });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive } },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({
            message: `User ${isActive ? "activated" : "deactivated"} successfully`,
            user,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user?._id?.toString()) {
            return res.status(400).json({ message: "Admin cannot delete their own account" });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getMe = async (req, res) => {
    return res.status(200).json(req.user);
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Old password and new password are required" });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "New password must be different" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!(await user.isPasswordCorrect(oldPassword))) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

