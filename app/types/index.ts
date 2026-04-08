export interface DatabaseGig {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at: string;
  per: "gig" | "hour" | "project" | "day";
  category_id: string;
  posted_by: string;
  cover?: string | null;
  categories: {
    id: string;
    name: string;
  };
  users: {
    id: string;
    name: string;
    profile_pic: string | null;
    institution: string;
    campus_verified: boolean;
  };
}
