"use client";

import React, { useState, useEffect } from "react";
import { LawyerProfileData, LawyerVerificationData } from "@/lib/portal/types";
import {
  ProfileCompletionExperience,
  ProfileCompletionProps,
} from "./profile-completion-experience";
import { getAdvocateFullProfile } from "@/app/actions/advocate-profile";
import { RefreshCw } from "lucide-react";

interface ProfileTabProps {
  userEmail: string;
  lawyerProfile: LawyerProfileData | null;
  verification: LawyerVerificationData | null;
  fullProfileData?: ProfileCompletionProps["initialData"];
}

export function ProfileTab({
  userEmail,
  lawyerProfile,
  verification,
  fullProfileData,
}: ProfileTabProps) {
  const [data, setData] = useState<ProfileCompletionProps["initialData"] | null>(
    fullProfileData || null
  );
  const [isLoading, setIsLoading] = useState(!fullProfileData);

  useEffect(() => {
    if (!fullProfileData) {
      let isMounted = true;
      getAdvocateFullProfile()
        .then((res) => {
          if (isMounted) {
            setData(res as unknown as ProfileCompletionProps["initialData"]);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("[ProfileTab Load Error]:", err);
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [fullProfileData]);

  if (isLoading || !data) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-[#205C43] animate-spin mx-auto" />
        <p className="text-xs text-[#69736D]">
          Loading advocate profile and credential records...
        </p>
      </div>
    );
  }

  return (
    <ProfileCompletionExperience
      initialData={data}
      onCompleteRedirect="/lawyer/dashboard"
    />
  );
}
