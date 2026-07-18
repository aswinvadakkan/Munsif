"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Options for the Razorpay checkout modal.
 */
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
  };
}

/**
 * Callbacks for the Razorpay checkout flow.
 */
export interface RazorpayCallbacks {
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
  onError?: (error: any) => void;
}

/**
 * Return type of the useRazorpay hook.
 */
export interface UseRazorpayReturn {
  /** Whether the Razorpay SDK script is loaded and ready */
  isLoaded: boolean;
  /** Error if the script failed to load */
  error: string | null;
  /** Open the Razorpay checkout modal with the given options */
  openCheckout: (
    options: RazorpayCheckoutOptions,
    callbacks: RazorpayCallbacks
  ) => void;
}

// Dynamically load the Razorpay checkout script
let scriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    // Check if already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * React hook for Razorpay checkout integration.
 *
 * Loads the Razorpay checkout script and provides an `openCheckout` function
 * to launch the payment modal.
 *
 * Usage:
 * ```tsx
 * const { isLoaded, error, openCheckout } = useRazorpay();
 *
 * const handlePay = () => {
 *   openCheckout(
 *     { key, amount, currency, name, description, order_id },
 *     {
 *       onSuccess: (res) => console.log(res),
 *       onDismiss: () => console.log("dismissed"),
 *     }
 *   );
 * };
 * ```
 */
export function useRazorpay(): UseRazorpayReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    loadRazorpayScript().then((success) => {
      if (success) {
        setIsLoaded(true);
      } else {
        setError(
          "Failed to load Razorpay checkout. Please check your internet connection and try again."
        );
      }
    });
  }, []);

  const openCheckout = useCallback(
    (options: RazorpayCheckoutOptions, callbacks: RazorpayCallbacks) => {
      if (!isLoaded) {
        callbacks.onError?.(new Error("Razorpay SDK not loaded yet"));
        return;
      }

      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        callbacks.onError?.(new Error("Razorpay is not available"));
        return;
      }

      const rzp = new RazorpayConstructor({
        ...options,
        modal: {
          ...options.modal,
          ondismiss: () => {
            callbacks.onDismiss?.();
          },
        },
        handler: (response: any) => {
          callbacks.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
      });

      rzp.on("payment.failed", (response: any) => {
        callbacks.onError?.(response.error || new Error("Payment failed"));
      });

      rzp.open();
    },
    [isLoaded]
  );

  return { isLoaded, error, openCheckout };
}
