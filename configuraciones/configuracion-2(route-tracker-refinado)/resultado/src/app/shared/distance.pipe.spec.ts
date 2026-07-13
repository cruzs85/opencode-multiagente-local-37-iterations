import { DistancePipe } from './distance.pipe';

describe('DistancePipe', () => {
  let pipe: DistancePipe;

  beforeEach(() => {
    pipe = new DistancePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform method', () => {
    it('should return "0 m" for 0 meters', () => {
      expect(pipe.transform(0)).toBe('0 m');
    });

    it('should return meters for values less than 1000', () => {
      expect(pipe.transform(1)).toBe('1 m');
      expect(pipe.transform(450)).toBe('450 m');
      expect(pipe.transform(999)).toBe('999 m');
    });

    it('should round meters to nearest integer', () => {
      expect(pipe.transform(450.4)).toBe('450 m');
      expect(pipe.transform(450.6)).toBe('451 m');
    });

    it('should return kilometers for values >= 1000', () => {
      expect(pipe.transform(1000)).toBe('1.0 km');
      expect(pipe.transform(1200)).toBe('1.2 km');
      expect(pipe.transform(15750)).toBe('15.8 km');
    });

    it('should show 1 decimal for km values less than 100', () => {
      expect(pipe.transform(1000)).toBe('1.0 km');
      expect(pipe.transform(1234)).toBe('1.2 km');
      expect(pipe.transform(9999)).toBe('10.0 km');
      expect(pipe.transform(99999)).toBe('100.0 km');
    });

    it('should round km values >= 100 to nearest integer', () => {
      expect(pipe.transform(100000)).toBe('100 km');
      expect(pipe.transform(100499)).toBe('100 km');
      expect(pipe.transform(100500)).toBe('101 km');
      expect(pipe.transform(150000)).toBe('150 km');
      expect(pipe.transform(999999)).toBe('1000 km');
    });

    it('should handle edge cases', () => {
      expect(pipe.transform(NaN)).toBe('—');
      expect(pipe.transform(Infinity)).toBe('—');
      expect(pipe.transform(-Infinity)).toBe('—');
      expect(pipe.transform(-100)).toBe('—');
    });

    it('should handle negative numbers', () => {
      expect(pipe.transform(-1)).toBe('—');
      expect(pipe.transform(-1000)).toBe('—');
    });

    it('should handle very large numbers', () => {
      expect(pipe.transform(1000000)).toBe('1000 km');
      expect(pipe.transform(1234567)).toBe('1235 km');
    });

    it('should handle decimal meters that convert to km', () => {
      expect(pipe.transform(1000.5)).toBe('1.0 km');
      expect(pipe.transform(1500.7)).toBe('1.5 km');
    });

    it('should handle boundary values', () => {
      // Boundary at 999 m
      expect(pipe.transform(999)).toBe('999 m');
      // Boundary at 1000 m
      expect(pipe.transform(1000)).toBe('1.0 km');
      // Boundary at 99999 m (99.999 km)
      expect(pipe.transform(99999)).toBe('100.0 km');
      // Boundary at 100000 m (100 km)
      expect(pipe.transform(100000)).toBe('100 km');
    });
  });
});