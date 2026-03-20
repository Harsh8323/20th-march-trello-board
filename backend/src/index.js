const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const organizationRoutes = require("./routes/organization.routes");
const memberRoutes = require("./routes/member.routes");
const boardRoutes = require("./routes/board.routes");
const issueRoutes = require("./routes/issue.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1/issues", issueRoutes);

app.listen(3000);
