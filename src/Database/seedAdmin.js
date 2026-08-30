require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../Models/User");

const seedAdmin = async () => {
  try {
    const mongoUrl = process.env.DBURL || "mongodb://127.0.0.1:27017/Woffy";
    await mongoose.connect(mongoUrl);

    const passwordPlain = "admin123";
    const hashedPassword = await bcrypt.hash(passwordPlain, 8);

    const adminEmail = (
      process.env.ADMIN_EMAIL || "rathodshubham7711@gmail.com"
    )
      .toLowerCase()
      .trim();

    // 1. Upsert official Admin (rathodshubham7711@gmail.com)
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.collection.insertOne({
        fullName: "Shubham Rathod (Admin)",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[Admin Seed] Created official admin: ${adminEmail}`);
    } else {
      await User.collection.updateOne(
        { email: adminEmail },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            isAdmin: true,
          },
        },
      );
      console.log(`[Admin Seed] Updated official admin: ${adminEmail}`);
    }

    // 2. Also grant admin privileges to existing 'shubh@gmail.com'
    await User.collection.updateOne(
      { email: "shubh@gmail.com" },
      {
        $set: {
          password: hashedPassword,
          role: "admin",
          isAdmin: true,
        },
      },
    );
    console.log(`[Admin Seed] Updated shubh@gmail.com with admin role`);

    const users = await User.find(
      {},
      { fullName: 1, email: 1, role: 1, isAdmin: 1 },
    );
    console.log("[Admin Seed] Available Users in DB:", users);

    await mongoose.disconnect();
  } catch (err) {
    console.error("[Admin Seed Error]:", err.message);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
