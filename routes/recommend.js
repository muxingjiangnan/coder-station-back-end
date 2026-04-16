const express = require("express");
const router = express.Router();

const { getSegmentFaultRecommendService } = require("../services/recommendService");
const { formatResponse } = require("../utils/tools");

/**
 * 获取 SegmentFault 精彩文章前 4 条
 */
router.get("/segmentfault", async function (req, res, next) {
  try {
    const result = await getSegmentFaultRecommendService();
    res.send(formatResponse(0, "", result));
  } catch (error) {
    console.error("[recommend route error]", error);
    next(error);
  }
});

module.exports = router;
