// Simulator-backed world perception. Keep this module free of controller
// decisions so it can later be replaced by camera/range-sensor estimates.
export function createSimPerception({ getRobotPose, getBallPose, getArena }) {
  return {
    sample() {
      const robot = getRobotPose();
      const ball = getBallPose();
      return { robot, ball, arena: getArena() };
    },
  };
}

export function wrapAngle(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function relativeTarget(robot, target) {
  const dx = target.x - robot.x;
  const dy = target.y - robot.y;
  return {
    distance: Math.hypot(dx, dy),
    bearing: wrapAngle(Math.atan2(dy, dx) - robot.yaw),
  };
}

