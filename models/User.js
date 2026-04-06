import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: [true, 'Username is required'], unique: true, lowercase: true, trim: true, index: true },
        email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],},
        password: { type: String, required: [true, 'Password is required'], minlength: [6, "Password must be at least 6 characters"] },
        role: {type: String, enum: ['User', 'Analyst', 'Admin']},
        isActive: {type: Boolean, default: true},
        refreshToken: {type: String}
    },
    {timestamps: true}
);

// Before saving the user, Hash the password(if Modified) using bcrypt
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare passwords to check if correct
userSchema.methods.isPasswordCorrect = async function(password){
    if(typeof password !== 'string' || !password) return false;
    if(!this.password) return false;
    return bcrypt.compare(password, this.password);
}

export const User = mongoose.model("User", userSchema);