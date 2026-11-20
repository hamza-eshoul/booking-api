import { AdminBookingMapper } from './AdminBookingMapper.js';

describe('AdminBookingMapper', () => {
  it('masks an email down to its first letter and domain', () => {
    expect(AdminBookingMapper.maskEmail('jane.doe@gmail.com')).toBe(
      'j***@gmail.com',
    );
  });

  it('hides a value that is not an email', () => {
    expect(AdminBookingMapper.maskEmail('nonsense')).toBe('***');
  });

  it('keeps the first name and the last initial', () => {
    expect(AdminBookingMapper.shortName('  Jane  Mary doe ')).toBe('Jane D.');
  });

  it('keeps a single name as it is', () => {
    expect(AdminBookingMapper.shortName('Jane')).toBe('Jane');
  });
});
