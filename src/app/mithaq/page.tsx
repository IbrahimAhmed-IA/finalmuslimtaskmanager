"use client";

import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";
import { FaCalendarAlt, FaChartLine, FaClock, FaMedal } from "react-icons/fa";

// Component that uses the context
const MithaqContent = () => {
  // Import inside the component to avoid context issues
  const { useWeeklyScoreContext } = require("@/context/weekly-score-context");
  const { weeklyScores, checkWeekEnd, getCurrentWeekNumber, getCurrentYear } =
    useWeeklyScoreContext();

  React.useEffect(() => {
    checkWeekEnd();
  }, [checkWeekEnd]);

  // Sort scores by year (descending) and then by week number (descending)
  const sortedScores = [...weeklyScores].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year; // Most recent year first
    }
    return b.weekNumber - a.weekNumber; // Most recent week first
  });

  return (
    <div className="py-6 w-full fade-in">
      <header className="page-header">
        <h1 className="text-3xl font-bold mb-1">Mithaq Al-Tatwir</h1>
        <p className="text-white/80">Track your weekly worship progress</p>
      </header>

      <div className="container mx-auto p-6">
        <div className="card p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-4 shadow-md">
              <FaCalendarAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Current Week
              </h2>
              <p className="text-gray-500">
                Week {getCurrentWeekNumber()} of {getCurrentYear()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-xl">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaChartLine className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-800">
                    Weekly Progress
                  </h3>
                  <p className="text-sm text-blue-600">
                    Track your task completions
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-5 rounded-xl">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <FaClock className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-purple-800">
                    Pomodoro Stats
                  </h3>
                  <p className="text-sm text-purple-600">
                    Track your focused time
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 p-5 rounded-xl">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <FaMedal className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-amber-800">
                    Achievements
                  </h3>
                  <p className="text-sm text-amber-600">
                    Unlock weekly rewards
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {sortedScores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedScores.map((score, index) => (
              <Card
                key={score.id}
                className="border border-gray-200 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="flex justify-between items-center">
                    <span>
                      Week {score.weekNumber}, {score.year}
                    </span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {new Date(score.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Task Completion
                        </p>
                        <span className="text-sm font-bold text-indigo-600">
                          {score.completionPercentage}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            score.completionPercentage > 75
                              ? "from-green-500 to-emerald-500"
                              : score.completionPercentage > 50
                                ? "from-blue-500 to-indigo-500"
                                : "from-amber-500 to-orange-500"
                          }`}
                          style={{ width: `${score.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Pomodoros
                        </p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {score.pomodoroCount}
                        </p>
                        <p className="text-xs font-semibold text-purple-700 mt-1">Minutes Achieved: {typeof score.focusMinutes === 'number' ? score.focusMinutes : score.pomodoroCount * 25}</p>
                      </div>

                      <div className="flex items-center h-14 w-14 bg-indigo-50 rounded-full justify-center">
                        <FaClock className="text-2xl text-indigo-500" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 flex justify-end">
                        Tracked on{" "}
                        {new Date(score.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center slide-up">
            <div className="inline-flex p-6 rounded-full bg-gray-50 mb-5">
              <FaChartLine className="text-indigo-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              No weekly records yet
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto">
              Your progress will be tracked and displayed here at the end of
              each week. Weekly records are saved after Friday at 12:00 AM.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function MithaqPage() {
  return (
    <MainLayout>
      <MithaqContent />
    </MainLayout>
  );
}
