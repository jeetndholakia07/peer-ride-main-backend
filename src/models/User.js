import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    mobile: {
        type: String,
        validate: {
            validator: (value) => /^\d{10}$/.test(value),
            message: "Invalid mobile format. Got value {VALUE}"
        },
        unique: true
    },
    role: {
        type: String,
        enum: ["passenger", "driver"],
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (value) =>
                /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
            message: (props) => `Invalid email format. Got value ${props.value}`,
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;