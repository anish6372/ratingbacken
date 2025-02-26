import { sendReferralEmail } from "./emailService.js";

(async () => {
    await sendReferralEmail("pandaanishkumaar@gmail.com", "anishpanda3@gmail.com");
})();
