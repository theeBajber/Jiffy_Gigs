"use client";

import React, { startTransition, useEffect, useRef, useState } from "react";
import {
  Brush,
  GraduationCap,
  MoreHorizontal,
  InfoIcon,
  LucideIcon,
  ArrowRight,
  CloudUpload,
  LightbulbIcon,
  CheckCircle2,
  BookOpen,
  Wrench,
  Heart,
  BadgeCheck,
  Brain,
  X,
  Plus,
  SquareX,
  ArrowLeft,
  FolderClock,
  Upload,
  ImageIcon,
  FileIcon,
  Trash2Icon,
  EyeIcon,
  MapPin,
} from "lucide-react";
import { poppins } from "@/app/ui/fonts";
import { GigCard } from "@/app/ui/cards";
import { createGig } from "@/app/hooks/gigsPost";

export default function PostGig() {
  const MAX_FILE_SIZE_MB = 5;
  const MAX_PORTFOLIO_FILES = 6;
  const MAX_TOTAL_UPLOAD_MB = 15;

  const [formData, setFormData] = useState({
    gigTitle: "",
    category: "Academic Support",
    description: "",
    budget: "",
    pricingType: "gig",
    location: "",
    cover: null as File | null,
    qualifications: "",
    skills: ["Graphic Design", "Figma", "Illustration"],
    portfolio: [] as File[],
  });
  const [selectedCategory, setSelectedCategory] = useState(formData.category);
  const [skills, setSkills] = useState<string[]>(formData.skills);
  const [addSkill, setAddSkill] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState("");
  const [cover, setCover] = useState<File | null>(formData.cover);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>(
    formData.portfolio,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioFileRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "academic-support", label: "Academic Support", icon: GraduationCap },
    { id: "creative-technical", label: "Creative & Technical", icon: Brush },
    { id: "tutoring", label: "Tutoring", icon: BookOpen },
    { id: "errands-help", label: "Errands & Practical Help", icon: Wrench },
    { id: "personal-lifestyle", label: "Personal & Lifestyle", icon: Heart },
    { id: "miscellaneous", label: "Miscellaneous", icon: MoreHorizontal },
  ];

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/image\/(png|jpg|jpeg|webp)/)) {
      alert("File Format Not Supported!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB!");
      return;
    }

    setCover(file);
  };
  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidType = files.find(
      (file) => !file.type.match(/image\/(png|jpg|jpeg|webp)/),
    );
    if (invalidType) {
      alert("Portfolio files must be png, jpg, jpeg, or webp images.");
      return;
    }

    const oversized = files.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );
    if (oversized) {
      alert(`Each portfolio file must be less than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    if (portfolioFiles.length + files.length > MAX_PORTFOLIO_FILES) {
      alert(`You can upload up to ${MAX_PORTFOLIO_FILES} portfolio files.`);
      return;
    }

    const currentTotalBytes = portfolioFiles.reduce(
      (sum, file) => sum + file.size,
      0,
    );
    const incomingTotalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const coverBytes = cover?.size || 0;

    if (
      currentTotalBytes + incomingTotalBytes + coverBytes >
      MAX_TOTAL_UPLOAD_MB * 1024 * 1024
    ) {
      alert(
        `Total upload size (cover + portfolio) must be under ${MAX_TOTAL_UPLOAD_MB}MB.`,
      );
      return;
    }

    setPortfolioFiles([...portfolioFiles, ...files]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };
  const handlePortfolioInputClick = () => {
    portfolioFileRef.current?.click();
  };
  const handleFileDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };
  const addNewSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
      setAddSkill(false);
    }
  };

  const [step, setStep] = useState<number>(1);
  let stepTitle =
    step === 1
      ? "Gig Details"
      : step === 2
        ? "Qualifications"
        : "Review & Publish";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, skills }));
  }, [skills]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, cover }));
  }, [cover]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, portfolio: portfolioFiles }));
  }, [portfolioFiles]);

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.gigTitle.trim()) {
          alert("Please enter a gig title");
          return false;
        }
        if (!formData.description.trim()) {
          alert("Please enter a description");
          return false;
        }
        if (!formData.budget) {
          alert("Please enter an estimated budget");
          return false;
        }
        if (!formData.location.trim()) {
          alert("Please enter your location");
          return false;
        }
        return true;

      case 2:
        if (!formData.qualifications.trim()) {
          alert("Please list your qualifications");
          return false;
        }
        if (formData.skills.length === 0) {
          alert("Please add at least one skill");
          return false;
        }
        return true;

      case 3:
        return true;

      default:
        return true;
    }
  };

  const handleNextstep = () => {
    if (validateStep(step)) setStep(step + 1);
  };
  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    const fd = new FormData();

    fd.append("title", formData.gigTitle);
    fd.append("description", formData.description);
    fd.append("price", formData.budget);
  fd.append("per", formData.pricingType);
    fd.append("location", formData.location);
    fd.append("category", formData.category);
    fd.append("qualifications", formData.qualifications);
  formData.skills.forEach((skill) => fd.append("skills[]", skill));

    if (cover) {
      fd.append("cover", cover);
    }

    portfolioFiles.forEach((file) => {
      fd.append("portfolio", file);
    });

    startTransition(async () => {
      await createGig(fd);
    });
  };

  function CategoryCard({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: LucideIcon;
  }) {
    return (
      <button
        type="button"
        className={`w-full h-20 rounded-xl border-2 flex flex-col items-center justify-center ${selectedCategory == title ? "border-primary-light text-primary-light" : "border-primary-light/30 hover:border-primary-light/50 text-primary-dark/80"}`}
        onClick={() => {
          setSelectedCategory(title);
          setFormData((prev) => ({ ...prev, category: title }));
        }}
      >
        <Icon
          className="size-5"
          strokeWidth={selectedCategory == title ? 3 : 2}
        />
        <h3 className="font-semibold text-sm">{title}</h3>
      </button>
    );
  }

  function SkillCard({
    title,
    onRemove,
  }: {
    title: string;
    onRemove: (skill: string) => void;
  }) {
    return (
      <div className="w-fit bg-primary-light/20 rounded-full text-sm px-3 py-1 text-primary-light font-semibold flex items-center gap-1 border-primary-light/30">
        {title}
        <button
          type="button"
          onClick={() => onRemove(title)}
          className="hover:text-error transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  function PortfolioCard({
    file,
    onRemove,
  }: {
    file: File;
    onRemove: () => void;
  }) {
    const isImage = file.type.startsWith("image/");
    return (
      <div className="group relative w-full h-40 rounded-lg bg-secondary/30 flex flex-col items-center justify-center gap-2 text-primary-dark/50">
        {isImage ? <ImageIcon /> : <FileIcon />}
        <span className="w-32 h-6 truncate text-center">{file.name}</span>
        <div className="absolute inset-0 bg-primary-dark/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <button
            type="button"
            className="rounded-lg p-2 bg-secondary"
            onClick={onRemove}
          >
            <Trash2Icon className="size-6 text-error hover:text-error/80" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full *:max-w-2xl p-4 text-primary-dark flex flex-col items-center justify-center gap-8 mt-20">
      <section className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <h4 className="size-12 text-neutral-light flex items-center justify-center text-xl font-semibold rounded-full bg-primary-light">
            {step}
          </h4>
          <div className="flex flex-col">
            <div className="text-primary-dark/80 font-semibold uppercase text-sm">{`step ${step} of 3`}</div>
            <div className={`${poppins.className} text-xl`}>{stepTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="rounded-2xl w-18 h-2 bg-primary-light"></div>
          <div
            className={`rounded-2xl w-18 h-2 ${step === 2 || step === 3 ? "bg-primary-light" : " bg-primary-light/30"}`}
          ></div>
          <div
            className={`rounded-2xl w-18 h-2  ${step === 3 ? "bg-primary-light" : " bg-primary-light/30"}`}
          ></div>
        </div>
      </section>
      {step === 1 && (
        <div className="bg-white rounded-2xl w-full flex flex-col gap-6 p-6 border-primary-light/20 border">
          <div className="flex flex-col gap-2 w-full">
            <label
              className="font-bold text-sm flex items-center gap-2"
              htmlFor="gigTitle"
            >
              Gig Title
              <button>
                <InfoIcon className="size-4 text-primary-dark/50 hover:text-primary-dark" />
              </button>
            </label>
            <input
              type="text"
              className="w-full border-2 border-primary-light/30 focus:border-primary-light rounded-lg outline-none p-2 px-4"
              id="gigTitle"
              value={formData.gigTitle}
              onChange={handleInputChange}
              placeholder="eg. Python tutoring for beginners"
            />
            <p className="text-sm text-primary-dark/50">
              Catchy titles work best. Keep it short and specific.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold text-sm">Category</label>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.label}
                  icon={category.icon}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold text-sm" htmlFor="description">
              Description
            </label>
            <textarea
              placeholder="Describe what it is you offer in detail. What can clients expect?"
              className="w-full rounded-xl min-h-24 border-2 px-4 py-2 outline-none transition-all border-primary-light/30 focus:border-primary-light"
              id="description"
              onChange={handleInputChange}
              value={formData.description}
            />
          </div>
          <div className="w-full *:w-full gap-4 flex items-center">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="budget">
                Estimated Budget
              </label>
              <div className="flex items-center gap-2 border-2 rounded-lg border-primary-light/30 focus-within:border-primary-light p-2">
                <span className="text-primary-dark/70">KSh</span>
                <input
                  type="number"
                  className="outline-none w-full pr-1"
                  id="budget"
                  onChange={handleInputChange}
                  value={formData.budget}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="pricingType">
                Pricing Type
              </label>
              <select
                id="pricingType"
                value={formData.pricingType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pricingType: e.target.value }))
                }
                className="w-full border-2 rounded-lg border-primary-light/30 focus:border-primary-light p-2 outline-none"
              >
                <option value="gig">Per Gig</option>
                <option value="hour">Per Hour</option>
                <option value="project">Per Project</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm" htmlFor="location">
                Location
              </label>
              <div className="w-full border-2 rounded-lg border-primary-light/30 focus-within:border-primary-light p-2 flex items-center gap-2">
                <MapPin className="text-primary-dark/70 size-6" />
                <input
                  type="text"
                  className="outline-none w-full"
                  id="location"
                  onChange={handleInputChange}
                  value={formData.location}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold text-sm" htmlFor="cover">
              Cover Image
            </label>
            <input
              type="file"
              id="cover"
              name="cover"
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div
              className={`border cursor-pointer border-dashed w-full h-40 rounded-lg flex flex-col items-center justify-center gap-1 text-primary-dark/50 text-sm ${cover ? "border-primary-light" : " border-primary-light/50"}`}
              onClick={handleFileInputClick}
              onDragOver={handleFileDrag}
              onDrop={handleFileDrop}
            >
              {!cover ? (
                <>
                  <CloudUpload />
                  <h4 className="text-primary-dark text-lg">
                    Click or drag a file to upload
                  </h4>
                  <p>PNG, JPG or WEBP (max. 5MB)</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="text-primary-light" />
                  <h4 className="text-primary-dark text-lg font-medium">
                    {cover.name}{" "}
                    <span className="text-primary-dark/50 text-sm">
                      ({(cover.size / 1024).toFixed(1)} KB)
                    </span>
                  </h4>
                  <p className="text-xs mt-1">Click or drag to change</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full mt-4">
            <button
              className="py-2 px-4 rounded-lg hover:bg-secondary/20 font-semibold"
              type="button"
            >
              Cancel
            </button>
            <button
              className="py-2 px-4 bg-primary-light hover:bg-primary-light/90 rounded-lg text-neutral-light font-semibold flex items-center gap-2"
              onClick={() => handleNextstep()}
            >
              Next: Qualifications
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="bg-white rounded-2xl w-full flex flex-col gap-6 p-6 border-primary-light/20 border">
          <div className="flex flex-col gap-2 w-full">
            <h2 className={`${poppins.className} text-2xl`}>
              Showcase your expertise
            </h2>
            <p className="text-primary-dark/70 text-md font-semibold">
              Tell clients why you're the right person for the job. Highlight
              your academic achievements and practical projects.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BadgeCheck className="text-primary-light" />
              Qualifications & Certifications
            </h3>
            <label
              className="font-bold text-sm flex items-center gap-2"
              htmlFor="qualifications"
            >
              List your relevant education, courses, or certificates
            </label>
            <textarea
              placeholder="eg. 3rd year Computer Science student, Certified UI/UX Designer"
              className="w-full rounded-xl min-h-24 border-2 px-4 py-2 outline-none transition-all border-primary-light/30 focus:border-primary-light"
              id="qualifications"
              onChange={handleInputChange}
              value={formData.qualifications}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Brain className="text-primary-light" />
              Core Skills
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {skills.map((skill) => (
                <SkillCard
                  key={skill}
                  title={skill}
                  onRemove={() => {
                    handleRemoveSkill(skill);
                  }}
                />
              ))}
              {!addSkill ? (
                <button
                  type="button"
                  className="w-fit bg-primary-light/20 rounded-full text-sm px-3 py-1 text-primary-dark/70 font-semibold flex items-center gap-1 border-primary-light/30"
                  onClick={() => setAddSkill(true)}
                >
                  <Plus className="size-4" />
                  Add Skill
                </button>
              ) : (
                <div className="border rounded-2xl px-3 py-1 text-sm w-45 flex items-center gap-2 focus-within:border-primary-light focus-within:border-2">
                  <input
                    className="outline-none w-full"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill..."
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && addNewSkill()}
                  />
                  <button type="button" onClick={() => addNewSkill()}>
                    <ArrowRight className="size-4 text-primary-light hover:text-primary-light/80" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddSkill(false);
                      setNewSkill("");
                    }}
                    className="text-xs"
                  >
                    <SquareX className="size-4 text-error hover:text-error/80" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FolderClock className="text-primary-light" />
              Portfolio & Work Samples
            </h3>
            <label className="font-bold text-sm flex items-center gap-2">
              Upload images, PDFs, or documents that demonstrate your previous
              work or school projects.
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2">
              <input
                type="file"
                accept="image/*, application/pdf"
                className="hidden"
                onChange={handlePortfolioUpload}
                ref={portfolioFileRef}
              />
              {portfolioFiles.map((file, index) => (
                <PortfolioCard
                  key={index}
                  file={file}
                  onRemove={() => {
                    setPortfolioFiles(
                      portfolioFiles.filter((_, i) => i !== index),
                    );
                  }}
                />
              ))}
              {portfolioFiles.length < 3 && (
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-2 border border-dashed rounded-lg p-4 h-40 border-primary-light/50 text-primary-dark/80 hover:text-primary-dark hover:border-primary-light"
                  onClick={() => handlePortfolioInputClick()}
                >
                  <Upload />
                  <div className="font-semibold">Add Project</div>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full mt-4">
            <button
              className="py-2 px-4 rounded-lg hover:bg-secondary/20 font-semibold flex items-center gap-2"
              type="button"
              onClick={() => handlePreviousStep()}
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>
            <button
              className="py-2 px-4 bg-primary-light hover:bg-primary-light/90 rounded-lg text-neutral-light font-semibold flex items-center gap-2"
              onClick={() => handleNextstep()}
            >
              Next: Review <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="bg-white rounded-2xl w-full flex flex-col gap-6 p-6 border-primary-light/20 border">
          <div className="flex flex-col gap-2 w-full">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <EyeIcon className="text-primary-light" />
              Marketplace Preview
            </h3>
            <div className="pointer-events-none">
              <GigCard
                title={formData.gigTitle}
                category={formData.category}
                durationPosted="Just Now"
                id="preview"
                description={formData.description}
                tags={formData.skills}
                giggerAvatar="/portraits/person1.jpg"
                proximity={formData.location}
                gigger="Faraj Salim"
                charges={`Ksh ${formData.budget}`}
                image={
                  formData.cover ? URL.createObjectURL(formData.cover) : ""
                }
                isAvailable={true}
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <h3>Gig Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="w-full flex-col gap-1">
                <div className="text-sm font-bold text-primary-dark/50">
                  Title
                </div>
                <div className="font-semibold text-primary-dark">
                  {formData.gigTitle}
                </div>
              </div>
              <div className="w-full flex-col gap-1">
                <div className="text-sm font-bold text-primary-dark/50">
                  Category
                </div>
                <div className="font-semibold text-primary-dark">
                  {formData.category}
                </div>
              </div>
              <div className="w-full flex-col gap-1">
                <div className="text-sm font-bold text-primary-dark/50">
                  Pricing
                </div>
                <div className="font-semibold text-primary-dark">
                  {`Ksh ${formData.budget} / ${formData.pricingType}`}
                </div>
              </div>
              <div className="w-full flex-col gap-1">
                <div className="text-sm font-bold text-primary-dark/50">
                  Location
                </div>
                <div className="font-semibold text-primary-dark">
                  {formData.location}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-between items-center mt-4">
            <div className="text-primary-dark/70 max-w-76">
              By clicking Publish, you agree to our Service Provider Terms and
              Community Guidelines.
            </div>
            <div className="flex items-center gap-2">
              <button
                className="py-2 px-4 rounded-lg hover:bg-secondary/20 font-semibold flex items-center gap-2"
                type="button"
                onClick={() => handlePreviousStep()}
              >
                <ArrowLeft className="size-4" />
                Previous
              </button>
              <button
                className="py-2 px-4 bg-primary-light hover:bg-primary-light/90 rounded-lg text-neutral-light font-semibold"
                onClick={() => handleSubmit()}
              >
                Publish Gig
              </button>
            </div>
          </div>
        </div>
      )}
      {step == 1 && (
        <section className="w-full bg-blue-200/20 rounded-2xl border border-primary-light/20 p-4 flex flex-col gap-2">
          <h4 className="flex items-center gap-2 text-primary-light font-bold">
            <LightbulbIcon className="size-6" />
            Pro Tip for Quick Bids
          </h4>
          <p className="text-primary-dark/70">
            Students are more likely to pick up gigs that have a clear title and
            a fair budget. Don't forget to upload any necessary files in the
            next step!
          </p>
        </section>
      )}
    </main>
  );
}
