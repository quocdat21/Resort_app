const jwt = require("jsonwebtoken");
const Plan = require("../models/KpiPlan");
//const bcrypt = require("bcrypt");

let User;
try {
  User = require("../models/User");
} catch (e) {
  User = null;
}

// ===== LOGIN =====
exports.login = async (req, res) => {
  console.log("------ LOGIN ------");

  try {
    const { email, password } = req.body;

    // ===== 1. GET ACTIVE PLAN =====
    let activePlan = await Plan.findOne({ isActive: true }).lean();
    console.log(activePlan._id);

    if (!activePlan) {
      return res.status(500).json({
        message: "No active KPI plan found"
      });
    }

    // ===== DEMO MODE =====
    if (!User) {
      const token = jwt.sign(
        {
          email,
          role: "KPI_MANAGER",
          orgCode: "HOCVIEN",
          planId: activePlan._id
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          email,
          role: "KPI_MANAGER",
          orgCode: "HOCVIEN",
          planId: activePlan._id
        }
      });
    }

    // ===== 2. FIND USER =====
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ===== 3. CHECK PASSWORD =====
    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // ===== 4. RESOLVE PLAN =====
    // 👉 Ưu tiên plan của user
    // 👉 fallback về active plan
    const finalPlanId = user.planId || activePlan._id;

    // ===== 5. TOKEN =====
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        orgCode: user.orgCode,
        planId: finalPlanId
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    console.log(finalPlanId);

    const resp = {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgCode: user.orgCode,
        planId: finalPlanId
      }
    };
    console.log(resp);
    //crossOriginIsolated.log(resp);
    return res.json(resp);


  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/*exports.login = async (req, res) => {
  console.log("------ LOGIN ------");

  try {
    const { email, password } = req.body;

    // ===== DEMO MODE =====
    if (!User) {
      const token = jwt.sign(
        {
          email,
          role: "KPI_MANAGER",
          orgCode: "HOCVIEN",
          planId: "DEFAULT_2026"
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          email,
          role: "KPI_MANAGER",
          orgCode: "HOCVIEN",
          planId: "DEFAULT_2026"
        }
      });
    }

    // ===== PRODUCTION =====
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ===== PASSWORD CHECK =====
    //const isMatch = await bcrypt.compare(password, user.password);
    //if (!isMatch) {
    //  return res.status(401).json({ message: "Wrong password" });
    //}

    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }
    // ===== TOKEN =====
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        orgCode: user.orgCode,
        planId: user.planId || "DEFAULT_2026"
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgCode: user.orgCode,
        planId: user.planId || "DEFAULT_2026"
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};*/

// ===== REGISTER =====
exports.register = async (req, res) => {
  try {
    if (!User) {
      return res.json({ message: "Demo mode" });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashed
    });

    res.json(user);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== ME =====
exports.me = async (req, res) => {
  try {
    res.json(req.user || { message: "No user" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
/*const jwt = require("jsonwebtoken");
// Nếu có model User thì dùng, chưa có vẫn chạy demo được
let User;
try {
  User = require("../models/User");
} catch (e) {
  User = null;
}

// ===== LOGIN =====
exports.login = async (req, res) => {
  console.log("----------------login-------------->");
  console.log(process.env.MONGO_URI);
  console.log(req.body);
  try {
    const { email, password } = req.body;

    // 👉 Demo mode (chưa có DB user vẫn login được)
    if (!User) {
      const token = jwt.sign(
        {
          email,
          role: "ADMIN",
          orgCode: "PTIT"
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      return res.json({ token });
    }

    // 👉 Production mode
     const user = await User.findOne({ email });
    //const user = await User.find({});
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("22222222222");
    // ⚠️ Nếu chưa dùng bcrypt thì tạm so sánh thô
    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        orgCode: user.orgCode
      },
      process.env.JWT_SECRET || "secret",{ expiresIn: "1d" }
    );

    res.json({ 
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgCode: user.orgCode
      }
 });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== REGISTER =====
exports.register = async (req, res) => {
  try {
    if (!User) {
      return res.json({ message: "Register (demo mode - no DB)" });
    }

    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== GET CURRENT USER =====
exports.me = async (req, res) => {
  try {
    // req.user được set từ middleware JWT
    res.json(req.user || { message: "No user (demo mode)" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};*/