import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL;

export type PublishJob = {
  tenantId: string;
  scheduledPostId: string;
  contentItemId: string;
  provider: string;
};

export function getPublishingQueue() {
  if (!redisUrl) {
    return null;
  }

  return new Queue<PublishJob>("publishing", {
    connection: {
      url: redisUrl
    }
  });
}

export async function enqueuePublishJob(job: PublishJob, runAt: Date) {
  const queue = getPublishingQueue();
  if (!queue) {
    return { queued: false, reason: "REDIS_URL is not configured" };
  }

  await queue.add("publish-approved-post", job, {
    delay: Math.max(0, runAt.getTime() - Date.now()),
    attempts: 3,
    backoff: { type: "exponential", delay: 60000 },
    removeOnComplete: 100,
    removeOnFail: 500
  });

  return { queued: true };
}
