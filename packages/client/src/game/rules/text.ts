import { getVariant } from "@hanabi/data";
import { getCharacterNameForPlayer } from "../reducers/reducerHelpers";
import { ClueType } from "../types/ClueType";
import { EndCondition } from "../types/EndCondition";
import type { GameMetadata } from "../types/GameMetadata";
import { getPlayerName, getPlayerNames } from "../types/GameMetadata";
import type { ActionClue, ActionDiscard, ActionPlay } from "../types/actions";
import * as cardRules from "./card";
import * as cluesRules from "./clues";
import * as handRules from "./hand";

const HYPO_PREFIX = "[Hypo] ";
const WORDS = ["zero", "one", "two", "three", "four", "five", "six"] as const;

export function clue(
  action: ActionClue,
  targetHand: number[],
  hypothetical: boolean,
  metadata: GameMetadata,
): string {
  const giver = metadata.playerNames[action.giver] ?? "unknown";
  const target = metadata.playerNames[action.target] ?? "unknown";
  const word = WORDS[action.list.length];
  const variant = getVariant(metadata.options.variantName);
  const hypoPrefix = hypothetical ? HYPO_PREFIX : "";

  // First, handle the case of clue text in some special variants.
  const characterName = getCharacterNameForPlayer(
    action.giver,
    metadata.characterAssignments,
  );
  if (variant.cowAndPig || variant.duck || characterName === "Quacker") {
    let actionName = "clues";
    if (variant.cowAndPig) {
      if (action.clue.type === ClueType.Color) {
        actionName = "moos";
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (action.clue.type === ClueType.Rank) {
        actionName = "oinks";
      }
    } else if (variant.duck || characterName === "Quacker") {
      actionName = "quacks";
    }

    const targetSuffix = target.endsWith("s") ? "'" : "'s";

    // Create a list of slot numbers that correspond to the cards touched.
    const slots: number[] = [];
    for (const order of action.list) {
      const slot = handRules.cardSlot(order, targetHand);
      if (slot === null) {
        throw new Error(`Failed to get the slot for card: ${order}`);
      }
      slots.push(slot);
    }
    slots.sort((a, b) => a - b);

    const slotWord = slots.length !== 1 ? "slots" : "slot";
    const slotsText = slots.join("/");

    return `${hypoPrefix}${giver} ${actionName} at ${targetSuffix} ${slotWord} ${slotsText}`;
  }

  // Handle the default case of a normal clue.
  let clueName = cluesRules.getClueName(
    action.clue.type,
    action.clue.value,
    variant,
    characterName,
  );
  if (action.list.length !== 1) {
    clueName += "s";
  }

  return `${hypoPrefix}${giver} tells ${target} about ${word} ${clueName}`;
}

export function gameOver(
  endCondition: EndCondition,
  playerIndex: number,
  score: number,
  metadata: GameMetadata,
  votes: number[] | null,
): string {
  const playerName = getPlayerName(playerIndex, metadata);

  switch (endCondition) {
    case EndCondition.InProgress:
    case EndCondition.Normal: {
      return `Players score ${score} points.`;
    }

    case EndCondition.Strikeout: {
      break;
    }

    case EndCondition.Timeout: {
      return `${playerName} ran out of time!`;
    }

    case EndCondition.TerminatedByPlayer: {
      return `${playerName} terminated the game!`;
    }

    case EndCondition.TerminatedByVote: {
      const playerNames = getPlayerNames(votes, metadata);
      return `${playerNames} voted to terminate the game!`;
    }

    case EndCondition.SpeedrunFail: {
      break;
    }

    case EndCondition.IdleTimeout: {
      return "Players were idle for too long.";
    }

    case EndCondition.CharacterSoftlock: {
      return `${playerName} was left with 0 clues!`;
    }

    case EndCondition.AllOrNothingFail: {
      break;
    }

    case EndCondition.AllOrNothingSoftlock: {
      return `${playerName} was left with 0 clues and 0 cards!`;
    }
  }

  return "Players lose!";
}

export function play(
  action: ActionPlay,
  slot: number | null,
  touched: boolean,
  playing: boolean,
  shadowing: boolean,
  hypothetical: boolean,
  metadata: GameMetadata,
): string {
  const variant = getVariant(metadata.options.variantName);
  const playerName = getPlayerName(action.playerIndex, metadata);

  const card =
    action.suitIndex === -1 ||
    action.rank === -1 ||
    (variant.throwItInAHole && (playing || shadowing))
      ? "a card"
      : cardRules.name(action.suitIndex, action.rank, variant);

  const location = slot === null ? "the deck" : `slot #${slot}`;

  let suffix = "";
  if (!touched) {
    suffix = " (blind)";
  }

  const hypoPrefix = hypothetical ? HYPO_PREFIX : "";
  return `${hypoPrefix}${playerName} plays ${card} from ${location}${suffix}`;
}

export function discard(
  action: ActionDiscard,
  slot: number | null,
  touched: boolean,
  playing: boolean,
  shadowing: boolean,
  hypothetical: boolean,
  metadata: GameMetadata,
): string {
  const variant = getVariant(metadata.options.variantName);
  const playerName = getPlayerName(action.playerIndex, metadata);

  let verb = "discards";
  if (action.failed) {
    verb = "fails to play";
    if (variant.throwItInAHole && (playing || shadowing)) {
      verb = "plays";
    }
  }

  let card = "";
  card =
    action.suitIndex === -1 || action.rank === -1
      ? "a card"
      : cardRules.name(action.suitIndex, action.rank, variant);

  const location = slot === null ? "the deck" : `slot #${slot}`;

  let suffix = "";
  if (action.failed && touched && !variant.throwItInAHole) {
    suffix = " (clued)";
  }
  if (action.failed && slot !== null && !touched) {
    suffix = " (blind)";
  }

  const hypoPrefix = hypothetical ? HYPO_PREFIX : "";
  return `${hypoPrefix}${playerName} ${verb} ${card} from ${location}${suffix}`;
}
