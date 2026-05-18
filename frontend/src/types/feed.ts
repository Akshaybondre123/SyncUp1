export type FeedCategory = "motivation" | "technique" | "mindset" | "recovery";

export interface Feed {
  id: string;
  coachName: string;
  message: string;
  category: FeedCategory;
  createdAt: string;
  updatedAt: string;
}

export interface FeedResponse {
  feeds: Feed[];
  source: "cache" | "database";
}
