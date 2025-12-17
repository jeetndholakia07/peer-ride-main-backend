import Chat from "../../models/Chat.js";
import { v4 as uuidv4 } from "uuid";

const findOrCreateRoom = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User id not found" });
        }

        const { receiverId } = req.query;

        if (!receiverId) {
            return res.status(404).json({ message: "Please provide receiver id" });
        }

        let room = await Chat.findOne({
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId },
            ],
        });

        if (!room) {
            room = await Chat.create({
                roomId: uuidv4(),
                sender: userId,
                receiver: receiverId,
            });
        }

        res.status(200).json({ roomId: room.roomId });
    } catch (err) {
        console.error("Error fetching room Id:", err);
        res.status(500).json({ message: "Server error" });
    }
}
export default findOrCreateRoom;