import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Couple from './src/models/couple.model.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Cleanup
        await User.deleteMany({ email: { $in: ['test_inviter@example.com', 'test_invitee@example.com'] } });
        await Couple.deleteMany({ invite_email: 'test_invitee@example.com' });

        // 1. Create Inviter
        const inviter = await User.create({
            first_name: 'Inviter',
            last_name: 'Test',
            email: 'test_inviter@example.com',
            password: 'password123' // Won't hash here but schema doesn't enforce hash in this test
        });
        console.log('Inviter created:', inviter._id);

        // 2. Create Invite (Couple pending)
        const couple = await Couple.create({
            user1: inviter._id,
            invite_email: 'test_invitee@example.com',
            invite_first_name: 'Invitee',
            status: 'pending'
        });
        console.log('Couple invite created:', couple._id);

        // 3. Create Invitee (User2) simulates signup
        const invitee = await User.create({
            first_name: 'Invitee',
            last_name: 'Test',
            email: 'test_invitee@example.com',
            password: 'password123'
        });
        console.log('Invitee created:', invitee._id);

        // 4. Invitee tries to get couple info (GET /couple)
        console.log('Searching couple for invitee:', invitee._id);
        const foundCouple = await Couple.findByUser(invitee._id);
        console.log('Result of findByUser for invitee:', foundCouple);

        if (foundCouple) {
            console.log('Invitee FOUND couple (Unexpected for pending invite)');
        } else {
            console.log('Invitee returned NULL (Expected for pending invite)');
        }

        // 5. Invitee tries to get requests (GET /couple/requests)
        console.log('Searching requests for invitee...');
        const requests = await Couple.find({
            $or: [{ user2: invitee._id }, { invite_email: invitee.email }],
            status: "pending"
        }).populate("user1", "first_name last_name email");

        console.log('Requests found:', requests.length);
        if (requests.length > 0) {
            console.log('Request 1 found OK');
        }

        /*
        // 6. Accept request
        if (requests.length > 0) {
            const reqCouple = requests[0];
            reqCouple.status = 'accepted';
            reqCouple.user2 = invitee._id;
            await reqCouple.save();
            console.log('Request accepted');

            // 7. Check couple again
            const finalCouple = await Couple.findByUser(invitee._id);
            console.log('Result of findByUser AFTER accept:', finalCouple);
        }
        */

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
