import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  newsletterService,
  type NewsletterSubscriptionInput,
} from "@/services/newsletter.service";

export const newsletterKeys = {
  subscribers: ["admin", "newsletter", "subscribers"] as const,
};

export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: (input: NewsletterSubscriptionInput) =>
      newsletterService.subscribe(input),
  });
}

export function useNewsletterSubscribers() {
  return useQuery({
    queryKey: newsletterKeys.subscribers,
    queryFn: newsletterService.getSubscribers,
  });
}

export function useDeleteNewsletterSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsletterService.deleteSubscriber,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: newsletterKeys.subscribers,
      });
    },
  });
}

export function useNewsletterUnsubscribe() {
  return useMutation({
    mutationFn: ({ token, reason }: { token: string; reason: string }) =>
      newsletterService.unsubscribe(token, reason),
  });
}
