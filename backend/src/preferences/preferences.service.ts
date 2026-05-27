import { Preferences } from "./preferences.model";

export const getTheme = async (): Promise<string> => {
  const doc = await Preferences.findOne();
  return doc ? doc.theme : "light";
};

export const setTheme = async (theme: string): Promise<string> => {
  const doc = await Preferences.findOneAndUpdate(
    {},
    { theme },
    { upsert: true, new: true },
  );
  return doc.theme;
};
