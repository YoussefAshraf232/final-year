"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Topbar from "@/components/layout/Topbar";
import BreadCrumb from "@/components/layout/BreadCrumb";
import Card, { CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import { profileService } from "@/services/profile.service";
import { tokenStorage } from "@/lib/tokenStorage";
import { User } from "@/types/user.types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError(null);
        const response = await profileService.get();
        const currentUser = response.data.data;
        setUser(currentUser);
        setProfileForm({
          firstName: currentUser.firstName ?? "",
          lastName: currentUser.lastName ?? "",
          phoneNumber: currentUser.phoneNumber ?? "",
          email: currentUser.email,
        });
      } catch {
        setError("Could not load your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await profileService.update(profileForm);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      tokenStorage.setUser(updatedUser);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await profileService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch {
      toast.error("Could not change password");
    }
  };

  return (
    <>
      <Topbar title="Profile" subtitle="Manage your account details" />
      <div className="p-6">
        <BreadCrumb items={[{ label: "Profile" }]} />
        {error ? (
          <ErrorState title="Profile unavailable" message={error} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardTitle className="mb-4 text-base">Personal information</CardTitle>
              <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
                <Input
                  id="firstName"
                  label="First name"
                  value={profileForm.firstName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  disabled={isLoading}
                />
                <Input
                  id="lastName"
                  label="Last name"
                  value={profileForm.lastName}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  disabled={isLoading}
                />
                <Input
                  id="phoneNumber"
                  label="Phone"
                  value={profileForm.phoneNumber}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phoneNumber: event.target.value }))
                  }
                  disabled={isLoading}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, email: event.target.value }))
                  }
                  disabled={isLoading}
                />
                <div className="md:col-span-2">
                  <Button type="submit" isLoading={isSaving} disabled={isLoading}>
                    Save changes
                  </Button>
                </div>
              </form>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardTitle className="mb-4 text-base">Account</CardTitle>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Username</dt>
                    <dd className="font-medium text-gray-900">{user?.username ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Role</dt>
                    <dd className="font-medium text-gray-900">{user?.role ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Created</dt>
                    <dd className="font-medium text-gray-900">
                      {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "-"}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <CardTitle className="mb-4 text-base">Change password</CardTitle>
                <form onSubmit={changePassword} className="space-y-4">
                  <Input
                    id="currentPassword"
                    label="Current password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))
                    }
                  />
                  <Input
                    id="newPassword"
                    label="New password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))
                    }
                  />
                  <Button type="submit" variant="outline">
                    Update password
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
