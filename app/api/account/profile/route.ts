import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { validateClientProfile } from "@/lib/validation";
import {
  getOrCreateClientProfile,
  updateClientProfile,
} from "@/lib/services/client-profile";

async function getAuthenticatedIdentity() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";

  if (!email) return null;

  return {
    userId,
    email,
    fullName: user?.fullName ?? "",
  };
}

export async function GET() {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in to access your profile.", 401);
  }

  try {
    const profile = await getOrCreateClientProfile({
      clerkUserId: identity.userId,
      email: identity.email,
      fullName: identity.fullName,
    });
    return apiSuccess({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/account/profile] GET failed:", message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to load account profile.", 500);
  }
}

export async function POST(request: NextRequest) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in to update your profile.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const validation = validateClientProfile(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please correct the highlighted fields.",
      400,
      validation.fieldErrors,
    );
  }

  try {
    const profile = await updateClientProfile(
      {
        clerkUserId: identity.userId,
        email: identity.email,
      },
      {
        personalInfo: {
          firstName: validation.data!.personalFirstName,
          lastName: validation.data!.personalLastName,
          phone: validation.data!.personalPhone,
        },
        businessInfo: {
          businessName: validation.data!.businessName,
          entityType: validation.data!.businessEntityType,
          website: validation.data!.businessWebsite,
        },
      },
    );

    return apiSuccess({
      profile,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/account/profile] POST failed:", message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to update account profile.", 500);
  }
}
