import React, { useRef, useEffect } from 'react';

const PinInput = ({ value, onChange, length = 4 }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newPin = value.split('');
    newPin[index] = val.substring(val.length - 1);
    const pinString = newPin.join('');
    onChange(pinString);

    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;
    onChange(pastedData);
  };

  return (
    <div className="flex gap-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="password"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          ref={(el) => (inputRefs.current[i] = el)}
          className="w-14 h-16 text-center text-2xl font-black border-2 border-chase-border rounded-xl focus:border-chase-blue focus:ring-1 focus:ring-chase-blue outline-none transition-all text-chase-navy"
        />
      ))}
    </div>
  );
};

export default PinInput;
