import { useState } from "react";
import { candidatesById } from "../data";
import { useI18n } from "../i18n";

/** Candidate avatar: the official portrait when we have one, layered over the
 *  coloured monogram. The monogram sits underneath as a base layer, so it shows
 *  while the photo is still loading and remains if the photo never arrives (the
 *  party host has bot-protection that can occasionally refuse a hotlinked
 *  image) — a reader never sees a broken-image icon or an empty square.
 *
 *  `referrerPolicy="no-referrer"` keeps the visitor's page out of the party
 *  server's logs — the tool is independent and the questionnaire anonymous, so
 *  it shouldn't leak who's browsing to a candidate's host. */
export function Avatar({
  candidateId,
  size,
  radius,
  fontSize,
}: {
  candidateId: string;
  size: number;
  radius: number;
  fontSize: number;
}) {
  const { t } = useI18n();
  const display = candidatesById[candidateId]?.display ?? {};
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="serif"
      style={{
        position: "relative",
        flex: "none",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        background: display.avatarBg ?? "#e7ddce",
        color: display.avatarInk ?? "#6b5f4c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: 700,
        overflow: "hidden",
      }}
    >
      {t.candidateInitial(candidateId)}
      {display.image && !failed && (
        <img
          src={display.image}
          alt={t.candidateName(candidateId)}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
