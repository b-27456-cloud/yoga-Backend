/**
 * Unit tests for Angle Calculator Math logic
 */

const { calculateAngle, evaluatePoseAccuracy } = require('./angle.calculator');

describe('Angle Calculator', () => {
  describe('calculateAngle', () => {
    it('should calculate a 90 degree angle correctly', () => {
      // Point A is on the Y axis, B is origin, C is on the X axis
      const a = { x: 0, y: 1, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(a, b, c);
      expect(Math.round(angle)).toBe(90);
    });

    it('should calculate a 180 degree angle correctly (straight line)', () => {
      // Point A is at x=-1, B is origin, C is at x=1
      const a = { x: -1, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };

      const angle = calculateAngle(a, b, c);
      expect(Math.round(angle)).toBe(180);
    });

    it('should return 0 if vectors have 0 magnitude', () => {
      const a = { x: 0, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 0, y: 0, z: 0 };

      const angle = calculateAngle(a, b, c);
      expect(angle).toBe(0);
    });
  });

  describe('evaluatePoseAccuracy', () => {
    it('should return 100% accuracy if within tolerance', () => {
      // Fake landmarks forming a 90 degree angle
      const landmarks = [];
      landmarks[0] = { x: 0, y: 1, z: 0, visibility: 0.9 };
      landmarks[1] = { x: 0, y: 0, z: 0, visibility: 0.9 };
      landmarks[2] = { x: 1, y: 0, z: 0, visibility: 0.9 };

      const referenceAngles = {
        'test_joint': { angle: 90, tolerance: 10, landmark_indices: [0, 1, 2] }
      };

      const result = evaluatePoseAccuracy(landmarks, referenceAngles);

      expect(result.overall_accuracy).toBe(100);
      expect(result.calculated_angles['test_joint']).toBeCloseTo(90, 1);
      expect(result.feedback).toContain('Great job!');
    });

    it('should return partial score if outside tolerance but within 2x tolerance', () => {
      // Fake landmarks forming an 80 degree angle
      // cos(80) = ~0.1736, so let's construct vectors
      const landmarks = [];
      landmarks[0] = { x: 0.1736, y: 0.9848, z: 0, visibility: 0.9 }; // Length 1
      landmarks[1] = { x: 0, y: 0, z: 0, visibility: 0.9 };
      landmarks[2] = { x: 1, y: 0, z: 0, visibility: 0.9 };

      const referenceAngles = {
        'test_joint': { angle: 90, tolerance: 5, landmark_indices: [0, 1, 2] }
      };
      
      // Target: 90. Actual: 80. Diff: 10.
      // Tolerance is 5. Diff is between 1x and 2x tolerance.
      // Score = 100 - ((10 - 5) / 5) * 50 = 100 - 50 = 50.

      const result = evaluatePoseAccuracy(landmarks, referenceAngles);

      expect(result.overall_accuracy).toBe(50);
      expect(result.feedback).not.toContain('Great job!');
    });

    it('should return 0 score and feedback if way outside tolerance', () => {
      // Fake landmarks forming a 0 degree angle
      const landmarks = [];
      landmarks[0] = { x: 1, y: 0, z: 0, visibility: 0.9 };
      landmarks[1] = { x: 0, y: 0, z: 0, visibility: 0.9 };
      landmarks[2] = { x: 1, y: 0, z: 0, visibility: 0.9 };

      const referenceAngles = {
        'test_joint': { angle: 90, tolerance: 10, landmark_indices: [0, 1, 2] }
      };

      const result = evaluatePoseAccuracy(landmarks, referenceAngles);

      expect(result.overall_accuracy).toBe(0);
      expect(result.feedback).toContain('Adjust your test_joint');
    });

    it('should return 0 accuracy and visibility warning if landmarks are missing', () => {
      const landmarks = [];
      landmarks[0] = { x: 0, y: 1, z: 0, visibility: 0.1 }; // Low visibility

      const referenceAngles = {
        'test_joint': { angle: 90, tolerance: 10, landmark_indices: [0, 1, 2] }
      };

      const result = evaluatePoseAccuracy(landmarks, referenceAngles);

      expect(result.overall_accuracy).toBe(0);
      expect(result.feedback).toContain('Ensure your full body is visible in the camera');
      expect(result.feedback).not.toContain('Cannot clearly see the test_joint');
    });
  });
});
