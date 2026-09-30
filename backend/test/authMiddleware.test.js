const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/authMiddleware");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const run = (middleware, req = {}, res = {}) => new Promise((resolve) => {
    const response = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; resolve({ req, res: this }); }
    };
    middleware(req, response, () => resolve({ req, res: response, next: true }));
});

describe("auth middleware", () => {
    it("rejects requests without a bearer token", async () => {
        const result = await run(protect, { headers: {} });
        assert.equal(result.res.statusCode, 401);
    });

    it("accepts a valid token and attaches the decoded user", async () => {
        const token = jwt.sign({ id: 7, role: "STUDENT" }, process.env.JWT_SECRET);
        const result = await run(protect, { headers: { authorization: `Bearer ${token}` } });
        assert.equal(result.next, true);
        assert.deepEqual(result.req.user, { id: 7, role: "STUDENT", iat: result.req.user.iat });
    });

    it("enforces allowed roles", async () => {
        const denied = await run(authorize("SYSTEM_ADMIN"), { user: { id: 7, role: "STUDENT" } });
        assert.equal(denied.res.statusCode, 403);
        const allowed = await run(authorize("STUDENT"), { user: { id: 7, role: "STUDENT" } });
        assert.equal(allowed.next, true);
    });
});
