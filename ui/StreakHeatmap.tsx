import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  activityMap: { [date: string]: boolean };
}

export default function StreakHeatmap({ activityMap }: Props) {
  const { colors } = useTheme();

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay(); // Sunday = 0
    const totalDays = lastDay.getDate();

    const result: {
      key: string;
      state: "active" | "missed" | "future" | "empty";
    }[] = [];

    // Padding before month starts
    for (let i = 0; i < startPadding; i++) {
      result.push({ key: `pad-${i}`, state: "empty" });
    }

    // Month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      if (d > today) {
        result.push({ key, state: "future" });
      } else if (activityMap[key]) {
        result.push({ key, state: "active" });
      } else {
        result.push({ key, state: "missed" });
      }
    }

    return result;
  }, [activityMap]);

  return (
    <View style={styles.container}>
      <View style={styles.centerWrap}>
        <View style={styles.grid}>
          {cells.map((cell) => {
            if (cell.state === "empty") {
              return (
                <View
                  key={cell.key}
                  style={[styles.cell, styles.empty]}
                />
              );
            }

            if (cell.state === "future") {
              return (
                <View
                  key={cell.key}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: "transparent",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.future}>?</Text>
                </View>
              );
            }

            if (cell.state === "missed") {
              return (
                <View
                  key={cell.key}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.cross}>✕</Text>
                </View>
              );
            }

            // ACTIVE DAY
            return (
              <View
                key={cell.key}
                style={[
                  styles.cell,
                  {
                    backgroundColor: "#4ade80",
                    borderColor: "#16a34a",
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  centerWrap: {
    alignItems: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
    columnGap: 8,
    maxWidth: 7 * (28 + 8),
  },

  cell: {
    width: 28,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },

  cross: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
  },

  future: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.6,
  },
});
