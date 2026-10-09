"use client";

import { useActionState } from "react";
import { inputBox, primaryButton } from "../admin/ui";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <label className="block text-base font-bold">
        パスワード
        <input
          type="password"
          name="password"
          className={inputBox}
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "password-error" : undefined}
          disabled={pending}
          required
        />
      </label>
      {state.error && (
        <p id="password-error" role="alert" className="-mt-2 text-base font-bold text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" className={`${primaryButton} w-full`} disabled={pending}>
        {pending ? "確かめています…" : "管理画面を開く"}
      </button>
    </form>
  );
}
