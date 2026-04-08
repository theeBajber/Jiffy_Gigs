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

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (categoryError || !category) {
    throw new Error(categoryError?.message || "Category not found");
  }

  const baseDescription = (formData.get("description") as string) || "";
  const qualifications = ((formData.get("qualifications") as string) || "").trim();
  const skills = formData
    .getAll("skills[]")
    .map((skill) => String(skill).trim())
    .filter(Boolean);

  const enrichedDescription = [
    baseDescription,
    qualifications ? `Qualifications:\n${qualifications}` : "",
    skills.length > 0 ? `Skills: ${skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data: gig, error: gigInsertError } = await supabase
    .from("gigs")
    .insert({
      title: formData.get("title"),
      description: enrichedDescription,
      price: Number(formData.get("price")),
      per: (formData.get("per") as string) || "gig",
      location: formData.get("location"),
      category_id: category.id,
      posted_by: user.id,
    })
    .select("id")
    .single();

  if (gigInsertError || !gig) {
    throw new Error(gigInsertError?.message || "Failed to create gig");
  }

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

  const portfolioFiles = formData.getAll("portfolio") as File[];
  if (portfolioFiles.length > 0) {
    const uploadedPortfolioRows: Array<{
      gig_id: string;
      file_path: string;
      file_name: string;
      file_type: string;
      file_size: number;
    }> = [];

    for (const file of portfolioFiles) {
      if (!file || file.size === 0) continue;
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${gig.id}/portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: portfolioUploadError } = await supabase.storage
        .from("GigPortfolio")
        .upload(path, file);

      if (!portfolioUploadError) {
        uploadedPortfolioRows.push({
          gig_id: gig.id,
          file_path: path,
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
        });
      }
    }

    if (uploadedPortfolioRows.length > 0) {
      const { error: portfolioInsertError } = await supabase
        .from("portfolios")
        .insert(uploadedPortfolioRows);

      if (portfolioInsertError) {
        console.error("Failed to save portfolio metadata:", portfolioInsertError);
      }
    }
  }

  redirect(`/gigs/${gig.id}`);
}
