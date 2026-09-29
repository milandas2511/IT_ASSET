import express from "express";
import Asset from "../models/Asset.js";

const router = express.Router();

// GET all assets, with optional search and status filter
router.get("/", async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      filter.$or = [
        { assetId: { $regex: search.trim(), $options: "i" } },
        { assetName: { $regex: search.trim(), $options: "i" } }
      ];
    }

    if (status === "Available" || status === "Assigned") {
      filter.status = status;
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const total = await Asset.countDocuments();
    const assigned = await Asset.countDocuments({ status: "Assigned" });
    const available = await Asset.countDocuments({ status: "Available" });
    res.json({ total, assigned, available });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one asset
router.get("/:id", async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST asset
router.post("/", async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Asset ID already exists" });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT asset
router.put("/:id", async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Asset ID already exists" });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE asset
router.delete("/:id", async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;