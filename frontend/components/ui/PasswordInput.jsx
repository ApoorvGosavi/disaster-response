'use client';

import { useState } from 'react';
import Input from './Input';

export default function PasswordInput({ label = 'Password', id = 'password', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input id={id} label={label} type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-[34px] text-xs font-medium uppercase tracking-tag text-fog-500 hover:text-fog-300"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
