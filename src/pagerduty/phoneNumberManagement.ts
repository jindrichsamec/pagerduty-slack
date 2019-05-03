import Debug from "debug";
import { getEnvVariable } from "@brandembassy/be-javascript-utils";
import {
  findPagerDutyContact,
  updatePagerDutyContact,
  createPagerDutyContact,
  removePagerDutyContact,
  createNotificationRule,
  PagerDutyContactMethod,
  PagerDutyNotificationRule
} from "./api";
import { PhoneNumber } from "../phoneNumber";

const debug = Debug("app:pagerduty");

const PAGERDUTY_USER_ID = getEnvVariable("PAGERDUTY_USER_ID");
const PAGERDUTY_SLACK_CONTACT_TYPE = getEnvVariable(
  "PAGERDUTY_SLACK_CONTACT_TYPE",
  "slack"
);

const createContactLabel = (
  prefix: string,
  phoneNumber: PhoneNumber
): string => {
  return `${prefix}-${phoneNumber[2]}`;
};

const buildPagerDutyContact = (
  phoneNumber: PhoneNumber
): PagerDutyContactMethod => {
  return {
    country_code: phoneNumber[0],
    address: phoneNumber[1],
    type: "phone_contact_method",
    label: createContactLabel(PAGERDUTY_SLACK_CONTACT_TYPE, phoneNumber)
  };
};

const buildNotificationRule = (
  contact: PagerDutyContactMethod
): PagerDutyNotificationRule => {
  return {
    type: "assignment_notification_rule",
    start_delay_in_minutes: 0,
    contact_method: {
      id: contact.id,
      type: contact.type
    },
    urgency: "high"
  };
};

export const removeActivePhoneNumber = async (
  phoneNumber: PhoneNumber
): Promise<void> => {
  const contact = await findActiveContact(phoneNumber);
  if (contact) {
    await removePagerDutyContact(PAGERDUTY_USER_ID, contact.id);
  }
};

export const setPhoneNumber = async (
  phoneNumber: PhoneNumber
): Promise<void> => {
  const contact = await findActiveContact(phoneNumber);
  debug("active contact %o", contact);
  if (contact) {
    debug("updating existing ", contact.id);
    await updatePagerDutyContact(
      PAGERDUTY_USER_ID,
      contact.id,
      buildPagerDutyContact(phoneNumber)
    );
  } else {
    debug("creating new contact %o", phoneNumber);
    const newContact = await createPagerDutyContact(
      PAGERDUTY_USER_ID,
      buildPagerDutyContact(phoneNumber)
    );
    debug("new contact %o was created", newContact);
    await createNotificationRule(
      PAGERDUTY_USER_ID,
      buildNotificationRule(newContact)
    );
  }
};

export const findActiveContact = async (
  phoneNumber: PhoneNumber
): Promise<PagerDutyContactMethod | null> => {
  const user = await findPagerDutyContact(PAGERDUTY_USER_ID);
  debug("pagerduty user %o", user);
  return user.contact_methods.find(
    (contact: PagerDutyContactMethod) =>
      contact.summary ===
      createContactLabel(PAGERDUTY_SLACK_CONTACT_TYPE, phoneNumber)
  );
};
