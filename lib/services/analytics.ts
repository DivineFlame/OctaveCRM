export function getMockAnalytics() {
  return {
    summary: {
      postsPublished: 128,
      engagement: 38420,
      reach: 742000,
      clicks: 12980,
      leadsGenerated: 436,
      approvalTurnaroundHours: 11.4
    },
    platformComparison: [
      { platform: "Instagram", reach: 320000, engagement: 18400, leads: 122 },
      { platform: "LinkedIn", reach: 148000, engagement: 8200, leads: 176 },
      { platform: "Gmail", reach: 43000, engagement: 3900, leads: 98 },
      { platform: "Facebook", reach: 231000, engagement: 7920, leads: 40 }
    ],
    campaignPerformance: [
      { name: "Millet Launch", leads: 210, clicks: 5820, approvalHours: 8 },
      { name: "Founder Stories", leads: 92, clicks: 2310, approvalHours: 14 },
      { name: "Retailer Nurture", leads: 134, clicks: 4850, approvalHours: 12 }
    ],
    bestContent: [
      { title: "Carousel: 5 reasons retailers want millet snacks", score: 94 },
      { title: "LinkedIn post: clean-label growth", score: 89 },
      { title: "Buyer email: product sheet follow-up", score: 86 }
    ]
  };
}
