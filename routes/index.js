const { app } = require("../app");

app.use("/api/business/v1", require("./business"));
app.use("/api/consumer/v1", require("./consumer"));
app.use("/api/agent/v1", require("./agent"));
app.use("/api/admin/v1", require("./admin"));
