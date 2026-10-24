"use client";

import React, { useState, useEffect } from "react";
import { LawyerProfileData, LawyerVerificationData } from "@/lib/portal/types";
import {
  ProfileCompletionExperience,
  ProfileCompletionProps,
} from "./profile-completion-experience";
import { getAdvocateFullProfile } from "@/app/actions/advocate-profile";
import { AnimatedGavelLoader } from "@/components/ui/animated-gavel-loader";

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
      <AnimatedGavelLoader
        variant="section"
        message="Loading advocate profile and credential records..."
        submessage="Synchronizing Bar Council enrollment and verification status"
      />
    );
  }

  return (
    <ProfileCompletionExperience
      initialData={data}
      onCompleteRedirect="/lawyer/dashboard"
    />
  );
}
