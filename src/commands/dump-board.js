"use strict";

var _ = require("underscore");
var duration = require("parse-duration");

var __ = function(
  program,
  output,
  logger,
  config,
  trello,
  translator,
  trelloApiCommands,
  defaults
) {
  var trelloApiCommand = {};

  trelloApiCommand.makeTrelloApiCall = function(options, onComplete) {
    var board = translator.getBoardsByName(options.board, function(a, b) {
      return a == b;
    });

    var dur = duration(options.since);
    var since = null;
    // if dur is null, then attempt to parse as date
    if (dur != null) {
      since = new Date(Date.now() - dur);
    } else {
      // if dur is null, then attempt to parse as date
      since = new Date(options.since);
    }
    since = `${since.getUTCFullYear()}-${since.getUTCMonth()}-${since.getUTCDate()}`;

    trello.get(
      `/1/boards/${board[0].id}`,
      {
        boards: "open",
        fields: "id,name",
        actions: "commentCard,copyCommentCard",
        action_fields: "all",
        actions_limit: 100,
        actions_since: since,
        cards: "open",
        card_fields: "id,name,labels,badges",
        card_attachments: true,
        labels: "all",
        lists: "open",
        list_fields: "id,name",
        members: "none",
        checklists: "none",
        organization: false
      },
      function(err, data) {
        if (err) {
          throw err;
        }
        output.normal(JSON.stringify(data));
      }
    );
  };

  trelloApiCommand.nomnomProgramCall = function() {
    var boardOption = {
      abbr: "b",
      metavar: "BOARD",
      help: "The board to dump",
      required: true
    };
    if (defaults.board && defaults.board != "") {
      boardOption.default = defaults.board;
    }
    var sinceOption = {
      abbr: "s",
      metavar: "SINCE",
      help: "The board to dump",
      required: true
    };
    if (defaults.since && defaults.since != "") {
      sinceOption.default = defaults.since;
    } else {
      sinceOption.default = "-1w";
    }
    program
      .command("dump-board")
      .help("Output the JSON data for a board and all nested resources")
      .options({
        board: boardOption,
        since: sinceOption
      })
      .callback(function(options) {
        trelloApiCommand.makeTrelloApiCall(options);
      });
  };

  return trelloApiCommand;
};

module.exports = __;
