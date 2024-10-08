import { Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import { User } from "../types/user";
import { axiosPromiseData } from "../utils/axiosPromise";
import reclaimApi from "./useApi";
import { useCallbackSafeRef } from "./useCallbackSafeRef";
import { ApiResponseUser } from "./useUser.types";

const cache = new Cache();

const useUser = () => {
  const { fetcher } = reclaimApi();

  const cachedUserObj = cache.get("user");
  const cachedUserDate = cache.get("userDate");

  const [currentUser, setCurrentUser] = useState<User | null>(cachedUserObj ? JSON.parse(cachedUserObj) : null);
  const [currentCacheDate, setCurrentUserCacheDate] = useState<Date | undefined>(
    cachedUserDate ? new Date(JSON.parse(cachedUserDate)) : undefined
  );

  const [isLoading, setIsLoading] = useState(true);

  const handleGetUser = useCallbackSafeRef(async () => {
    try {
      const currentDate = new Date();
      if (currentDate.valueOf() - (currentCacheDate?.valueOf() || 0) < 1000 * 1800) {
        return;
      }
      setIsLoading(true);

      const [user, error] = await axiosPromiseData<ApiResponseUser>(fetcher("/users/current"));

      if (!user || error) throw error;

      setCurrentUser(user);
      setCurrentUserCacheDate(new Date());

      cache.set("user", JSON.stringify(user));
      cache.set("userDate", JSON.stringify(new Date().toISOString()));
    } catch (error) {
      console.error("Error while fetching user", error);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void handleGetUser();
  }, []);

  return {
    currentUser,
    isLoading,
  };
};

export { useUser };
