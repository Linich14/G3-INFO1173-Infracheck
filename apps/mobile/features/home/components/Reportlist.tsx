import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { ReportCard } from "~/features/posts";
import { Report } from "~/features/comments";

export default function ReportList({
  reports,
  onCommentPress,
  insets,
  refreshing,
  onRefresh,
}: {
  reports: Report[];
  onCommentPress: (report: Report) => void;
  insets: any;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <ScrollView
      className="mt-4 px-4"
      contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#537CF2" />}
    >
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          {...report}
          onComment={() => onCommentPress(report)}
          onFollow={() => console.log("Seguir")}
          onMore={() => console.log("Más opciones")}
          onLocation={() => console.log("Ubicación")}
          onUpvote={() => console.log("Upvote")}
          onShare={() => console.log("Compartir")}
        />
      ))}
    </ScrollView>
  );
}
