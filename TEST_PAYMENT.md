# Testing Thawani Payment

## Test Card Details (Correct Format)

### For Success:
- **Card Number**: 4242 4242 4242 4242 (or 4242424242424242 without spaces)
- **Expiry Date**: 12/25 (or any future date like 01/26, 03/27, etc.)
- **CVV**: 123 (any 3 digits)
- **Cardholder Name**: TEST USER (any name)

### Common Issues:

1. **Expiry Date Format**
   - ❌ Wrong: 1234
   - ✅ Correct: 12/25 (MM/YY format)
   - Must be a future date

2. **Minimum Amount**
   - Must be at least 0.100 OMR (100 baisa)
   
3. **Card Number**
   - Can have spaces or not: both "4242 4242 4242 4242" and "4242424242424242" work

## Try Again:
- Card: 4242424242424242
- Expiry: 12/25
- CVV: 123
