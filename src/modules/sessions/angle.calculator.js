/**
 * Angle Calculator
 * Math utility for AI Yoga Pose evaluation.
 * Calculates 3D angles from MediaPipe landmarks and determines accuracy.
 */

/**
 * Calculate the angle between three 3D points (A, B, C) where B is the vertex.
 * Uses the dot product of vectors BA and BC.
 *
 * @param {Object} a - Point A {x, y, z}
 * @param {Object} b - Point B (vertex) {x, y, z}
 * @param {Object} c - Point C {x, y, z}
 * @returns {number} Angle in degrees (0-180)
 */
function calculateAngle(a, b, c) {
  // Vector BA
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };

  // Vector BC
  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: c.z - b.z,
  };

  // Dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;

  // Magnitudes
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  // Avoid division by zero
  if (magBA === 0 || magBC === 0) return 0;

  // Calculate cosine of the angle
  let cosAngle = dotProduct / (magBA * magBC);
  
  // Clamp to [-1, 1] to avoid floating point errors for acos
  cosAngle = Math.max(-1, Math.min(1, cosAngle));

  // Convert to degrees
  const angleRad = Math.acos(cosAngle);
  return angleRad * (180 / Math.PI);
}

/**
 * Compare actual landmarks against a set of reference angles for a pose.
 *
 * @param {Array} landmarks - Array of 33 MediaPipe landmarks [{x, y, z, visibility}]
 * @param {Map|Object} referenceAngles - Map of joint names to { angle, tolerance, landmark_indices: [a,b,c] }
 * @returns {Object} { overall_accuracy (0-100), calculated_angles, feedback }
 */
function evaluatePoseAccuracy(landmarks, referenceAngles) {
  let totalScore = 0;
  let numJoints = 0;
  const calculatedAngles = {};
  const feedback = [];

  // Convert Mongoose Map to plain object if needed
  const refs = referenceAngles instanceof Map 
    ? Object.fromEntries(referenceAngles) 
    : referenceAngles;

  for (const [jointName, ref] of Object.entries(refs)) {
    const [idxA, idxB, idxC] = ref.landmark_indices;

    const pA = landmarks[idxA];
    const pB = landmarks[idxB];
    const pC = landmarks[idxC];

    // Check visibility (MediaPipe threshold is usually > 0.5)
    if (!pA || !pB || !pC || pA.visibility < 0.5 || pB.visibility < 0.5 || pC.visibility < 0.5) {
      feedback.push(`Cannot clearly see the ${jointName}`);
      continue;
    }

    const actualAngle = calculateAngle(pA, pB, pC);
    calculatedAngles[jointName] = actualAngle;

    const diff = Math.abs(actualAngle - ref.angle);

    // Scoring logic
    let score = 0;
    if (diff <= ref.tolerance) {
      score = 100; // Perfect within tolerance
    } else if (diff <= ref.tolerance * 2) {
      // Partial credit if slightly outside tolerance
      score = 100 - ((diff - ref.tolerance) / ref.tolerance) * 50;
    } else {
      // Outside 2x tolerance is 0 for this joint
      score = 0;
      feedback.push(`Adjust your ${jointName}`);
    }

    totalScore += score;
    numJoints++;
  }

  // If no joints could be evaluated, return 0
  if (numJoints === 0) {
    return {
      overall_accuracy: 0,
      calculated_angles: calculatedAngles,
      feedback: ['Ensure your full body is visible in the camera'],
    };
  }

  const overallAccuracy = Math.round(totalScore / numJoints);

  if (overallAccuracy > 85 && feedback.length === 0) {
    feedback.push('Great job!');
  }

  return {
    overall_accuracy: overallAccuracy,
    calculated_angles: calculatedAngles,
    feedback,
  };
}

module.exports = {
  calculateAngle,
  evaluatePoseAccuracy,
};
