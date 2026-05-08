/**
 * components/OtpInputBoxes.tsx
 *
 * Reusable 6-digit OTP input with individual boxes.
 * Auto-advances on input, backspace moves to previous box.
 */

import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

interface OtpInputBoxesProps {
  /** Number of digits (default 6) */
  length?: number;
  /** Called on every change with current code string */
  onChange?: (code: string) => void;
  /** Called when all boxes are filled */
  onComplete?: (code: string) => void;
  /** Disable all inputs */
  disabled?: boolean;
}

export default function OtpInputBoxes({
  length = 4,
  onChange,
  onComplete,
  disabled = false,
}: OtpInputBoxesProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.replace(/[^0-9]/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    const code = newDigits.join('');
    onChange?.(code);

    // Auto-advance to next box
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    // Check if complete
    if (digit && code.length === length && !code.includes('')) {
      const fullCode = newDigits.join('');
      if (fullCode.length === length) {
        onComplete?.(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous box on backspace when current box is empty
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      refs.current[index - 1]?.focus();
      onChange?.(newDigits.join(''));
    }
  };

  /** Allow parent to reset the boxes */
  const reset = () => {
    setDigits(Array(length).fill(''));
    refs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            disabled ? styles.boxDisabled : null,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
        />
      ))}
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAP = 8;
const MAX_BOX_WIDTH = 46;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP,
    marginVertical: 20,
    width: '100%',
  },
  box: {
    width: Math.min(MAX_BOX_WIDTH, (SCREEN_WIDTH - 100) / 6),
    height: 52,
    borderWidth: 1.5,
    borderColor: '#D9D9D9',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    backgroundColor: '#FAFAFA',
  },
  boxFilled: {
    borderColor: '#E8304A',
    backgroundColor: '#FFF5F6',
  },
  boxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
  },
});
