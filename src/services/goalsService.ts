import axiosInstance from "./axiosInstance";

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  type: "financial" | "personal";
  createdAt: string;
}

// Shapes returned by JSONPlaceholder /posts
interface ApiPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const EMOJIS = ["💰", "🏠", "✈️", "📚", "🎯", "💪", "🧘", "🎨", "🚗", "🎓"];

function mapPostToGoal(post: ApiPost): Goal {
  return {
    id: String(post.id),
    name: post.title.slice(0, 40),
    emoji: EMOJIS[post.id % EMOJIS.length],
    target: (post.id % 10 + 1) * 500,
    saved: (post.id % 5) * 100,
    type: post.id % 2 === 0 ? "financial" : "personal",
    createdAt: new Date().toISOString(),
  };
}

// GET — all goals (reads first 5 from API)
export async function fetchGoals(): Promise<Goal[]> {
  const { data } = await axiosInstance.get<ApiPost[]>("/posts", {
    params: { _limit: 5 },
  });
  return data.map(mapPostToGoal);
}

// GET — single goal by id
export async function fetchGoalById(id: string): Promise<Goal> {
  const { data } = await axiosInstance.get<ApiPost>(`/posts/${id}`);
  return mapPostToGoal(data);
}

// POST — create a new goal
export async function createGoal(goal: Omit<Goal, "id">): Promise<Goal> {
  const { data } = await axiosInstance.post<ApiPost & { id: number }>("/posts", {
    title: goal.name,
    body: JSON.stringify({ emoji: goal.emoji, target: goal.target, type: goal.type }),
    userId: 1,
  });
  return { ...goal, id: String(data.id) };
}

// PUT — replace a goal entirely
export async function updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
  const { data } = await axiosInstance.put<ApiPost>(`/posts/${id}`, {
    id: Number(id),
    title: goal.name ?? "",
    body: JSON.stringify({ saved: goal.saved }),
    userId: 1,
  });
  return mapPostToGoal(data);
}

// DELETE — remove a goal
export async function deleteGoal(id: string): Promise<void> {
  await axiosInstance.delete(`/posts/${id}`);
}
