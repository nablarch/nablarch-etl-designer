package com.nablarch.etl.designer;

import com.nablarch.etl.designer.parser.BpmnParser;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Collectors;

/**
 * ETLデザイナーで作成したbpmn形式のジョブ定義(.bpmn)を、JSR352形式のジョブ定義(.xml)に変換する。
 *
 * job-streamer-control-bus(https://github.com/job-streamer/job-streamer-control-bus)のクラスを利用
 * 2017/12/11時点で、control-busのversionは　1.2.2　を使用
 *   /src/java/net/unit8/job_streamer/control_bus/bpmn/BpmnParser.java
 *   /src/java/net/unit8/job_streamer/control_bus/bpmn/BpmnStructureVisitor.java
 *
 * maven-assembly-pluginを使用して実行可能jarを作成している。
 * 第一引数にETLデザイナーで作成したbpmnファイルのパスを指定する。
 * 第二引数に出力するジョブ定義ファイルのパスを指定する。
 * 出力するファイルと同名のファイルが既に存在する場合は、上書きする。
 *
 * @author yoshinouchi.ryota
 */
public class Main {
    public static void main(String[] args) throws IOException {
        if(args.length != 2){
            System.out.println("requires exactly 2 argument.");
            System.exit(1);
        }

        String inputFilePath = args[0];
        String outputFilePath = args[1];

        Document document = new BpmnParser().parse(readFile(inputFilePath));
        writeFile(outputFilePath, document.toString());
    }

    private static String readFile(String path) throws IOException {
        return Files.lines(Paths.get(path), Charset.forName("UTF-8"))
                .collect(Collectors.joining(System.getProperty("line.separator")));
    }

    private static void writeFile(String path, String content) throws IOException {
        Files.write(Paths.get(path), content.getBytes(Charset.forName("UTF-8")));
    }
}
