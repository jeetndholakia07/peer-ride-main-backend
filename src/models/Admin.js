import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                if (value && value.trim() !== "") {
                    return /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
                }
                return true;
            },
            message: (props) => `Invalid email format. Got value ${props.value}`,
        }
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;