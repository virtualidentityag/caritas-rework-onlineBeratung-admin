import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactComponent as CheckmarkIcon } from "../../resources/img/svg/checkmark.svg";
import { Text } from "../text/Text";

export function TwoFactorAuthResendMail(resendHandler: any) {
  const { t } = useTranslation();
  const [isCodeSent, setIsCodeSent] = useState(false);
  return (
    <div className="twoFactorAuthResendMail">
      <Text
        className="bold"
        text={t("twoFactorAuth.activate.email.resend.headline")}
        type="infoLargeStandard"
      />
      {isCodeSent ? (
        <p className="text text__infoLargeStandard">
          <CheckmarkIcon /> {t("twoFactorAuth.activate.email.resend.sent")}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            resendHandler(() => {
              setIsCodeSent(true);
              window.setTimeout(() => {
                setIsCodeSent(false);
              }, 2000);
            });
          }}
        >
          {t("twoFactorAuth.activate.email.resend.new")}
        </button>
      )}
    </div>
  );
}
