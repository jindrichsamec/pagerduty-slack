import fetch from "node-fetch";
import { getEnvVariable } from "@brandembassy/be-javascript-utils";

const SLACK_OAUTH_ACCESS_TOKEN = getEnvVariable("SLACK_OAUTH_ACCESS_TOKEN");

export interface UserProfile {
  phone?: string;
  display_name?: string;
}

interface UserResponse {
  ok: boolean;
  profile: UserProfile;
}

export const fetchSlackUserProfile = async (
  userId: string
): Promise<UserProfile> => {
  const response = await fetch(
    `https://slack.com/api/users.profile.get?user=${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SLACK_OAUTH_ACCESS_TOKEN}`
      }
    }
  );
  if (response.status !== 200) {
    throw new Error(`Invalid http response status "${response.status}"`);
  }

  const responseBody: string = await response.text();
  try {
    const responseData: UserResponse = JSON.parse(responseBody);
    return responseData.profile;
  } catch (err) {
    throw `Can't parse response "${responseBody}"`;
  }
};
