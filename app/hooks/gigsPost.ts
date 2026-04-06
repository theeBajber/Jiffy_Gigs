"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function createGig(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const categoryName = formData.get("category") as string;

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (!category) throw new Error("Category not found");

  const { data: gig } = await supabase
    .from("gigs")
    .insert({
      title: formData.get("title"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      location: formData.get("location"),
      category_id: category.id,
      posted_by: user.id,
    })
    .select()
    .single();

  const coverFile = formData.get("cover") as File;
  console.log(
    "Cover file:",
    coverFile
      ? {
          name: coverFile.name,
          size: coverFile.size,
          type: coverFile.type,
          exists: true,
        }
      : "No cover file",
  );
  if (coverFile && coverFile.size > 0) {
    const fileExt = coverFile.name.split(".").pop();
    const coverPath = `${user.id}/${gig.id}/cover-${Date.now()}.${fileExt}`;
    console.log("Extension: ", fileExt);
    console.log("Path: ", coverPath);

    const { error: uploadError } = await supabase.storage
      .from("GigCovers")
      .upload(coverPath, coverFile);

    if (!uploadError) {
      await supabase.from("gigs").update({ cover: coverPath }).eq("id", gig.id);
    }
    console.log(uploadError);
  }
  redirect(`/gigs/${gig.id}`);
}
