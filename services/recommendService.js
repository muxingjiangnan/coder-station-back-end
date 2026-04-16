const { getSegmentFaultHotArticles } = require("../scripts/segmentfaultCrawler");

async function getSegmentFaultRecommendService() {
  return await getSegmentFaultHotArticles();
}

module.exports = {
  getSegmentFaultRecommendService,
};
